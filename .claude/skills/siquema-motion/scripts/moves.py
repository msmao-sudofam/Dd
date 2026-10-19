#!/usr/bin/env python3
"""Move registry for SÍ QUEMA motion: every move has a shelf life.

  moves.py list [--status new|current|watch|retired]
  moves.py use <id> [<id> ...]                  log that these moves shipped
  moves.py set <id> <status> --note "<why>"     M Mo's call
  moves.py add <id> "<name>" --why "..." --next "..." [--source ...]
  moves.py review                               suggest Keep / Evolve / Watch / Retire
"""
import argparse
import json
import sys
from collections import Counter
from datetime import date
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "moves.json"
STATUSES = ("new", "current", "watch", "retired")


def load():
    return json.loads(PATH.read_text())


def save(data):
    PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def find(data, move_id):
    for m in data["moves"]:
        if m["id"] == move_id:
            return m
    sys.exit(f"no move '{move_id}'. run: moves.py list")


def days_since(d):
    return (date.today() - date.fromisoformat(d)).days if d else None


def cmd_list(data, args):
    moves = [m for m in data["moves"] if not args.status or m["status"] == args.status]
    counts = Counter(m["status"] for m in data["moves"])
    print(f"{len(data['moves'])} moves  ·  " + " · ".join(f"{s.title()} {counts.get(s, 0)}" for s in STATUSES))
    for status in STATUSES:
        group = [m for m in moves if m["status"] == status]
        if not group:
            continue
        print(f"\n[{status}]")
        for m in group:
            used = f"used {m['uses']}x, last {m['last_used']}" if m["uses"] else "never used"
            print(f"  {m['id']:<26} {m['name']}  ({used})")


def cmd_use(data, args):
    today = date.today().isoformat()
    moves = [find(data, move_id) for move_id in args.ids]
    retired = [m["id"] for m in moves if m["status"] == "retired"]
    if retired:
        sys.exit(f"retired, can't ship: {', '.join(retired)}. Pick another move or ask M Mo to un-retire it. Nothing logged.")
    for move_id, m in zip(args.ids, moves):
        m["uses"] += 1
        m["last_used"] = today
        print(f"logged {move_id} ({m['uses']}x)")
    save(data)


def cmd_set(data, args):
    m = find(data, args.id)
    old = m["status"]
    m["status"] = args.status
    m["history"].append({"date": date.today().isoformat(), "from": old, "to": args.status, "note": args.note})
    save(data)
    print(f"{args.id}: {old} → {args.status}")


def cmd_add(data, args):
    if any(m["id"] == args.id for m in data["moves"]):
        sys.exit(f"'{args.id}' already exists")
    data["moves"].append({
        "id": args.id, "name": args.name, "status": "new", "why": args.why, "next": args.next,
        "source": args.source, "added": date.today().isoformat(), "last_used": None, "uses": 0, "history": [],
    })
    save(data)
    print(f"added {args.id} as new")


def suggest(m):
    """Claude flags, M Mo makes the call. Returns (call, reason) or None."""
    age = days_since(m["added"])
    idle = days_since(m["last_used"])
    s, uses = m["status"], m["uses"]
    if s == "new" and uses >= 3:
        return "Keep → current", f"shipped {uses}x"
    if s == "new" and uses == 0 and age >= 45:
        return "Retire", f"never tried in {age} days"
    if s == "current" and uses >= 8:
        return "Evolve", f"shipped {uses}x; becoming a habit, write a new 'next'"
    if s == "current" and idle is not None and idle >= 60:
        return "Watch", f"not used in {idle} days"
    if s == "watch" and (idle or age) >= 45:
        return "Retire", f"on watch with no use in {idle or age} days"
    return None


def cmd_review(data, args):
    counts = Counter(m["status"] for m in data["moves"])
    print(f"{len(data['moves'])} moves, and M Mo makes the call")
    print("  " + " · ".join(f"{s.title()} {counts.get(s, 0)}" for s in STATUSES))
    flagged = [(m, *r) for m in data["moves"] if m["status"] != "retired" and (r := suggest(m))]
    if not flagged:
        print("\nClaude flags: nothing right now.")
        return
    print("\nClaude flags:")
    for m, call, reason in flagged:
        print(f"  {m['id']:<26} {call:<16} {reason}")
    print('\nApply with: moves.py set <id> <status> --note "<why>"')


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    sp = sub.add_parser("list"); sp.add_argument("--status", choices=STATUSES)
    sp = sub.add_parser("use"); sp.add_argument("ids", nargs="+")
    sp = sub.add_parser("set"); sp.add_argument("id"); sp.add_argument("status", choices=STATUSES); sp.add_argument("--note", required=True)
    sp = sub.add_parser("add"); sp.add_argument("id"); sp.add_argument("name"); sp.add_argument("--why", required=True); sp.add_argument("--next", required=True); sp.add_argument("--source", default="")
    sub.add_parser("review")
    args = p.parse_args()
    data = load()
    {"list": cmd_list, "use": cmd_use, "set": cmd_set, "add": cmd_add, "review": cmd_review}[args.cmd](data, args)


if __name__ == "__main__":
    main()
