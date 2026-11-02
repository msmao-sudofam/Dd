from pathlib import Path
import shutil
src=Path('C:/Users/Moqui/.codex/generated_images/01a190ad-17bb-7351-9cf3-6aed3b7f0565')
dest=Path('cgc/creative/video-concepts-2026-10-31')
files={'curtain-wall-after.png':'exec-859b44c2-47e4-41b3-83e5-804d97834b16.png','curtain-wall-before.png':'exec-5c95d1de-8490-42e3-aced-fbdfce60319b.png','entrance-light.png':'exec-0b36c196-4d62-44b1-b1b3-0f92789cb6f0.png','storyboard-the-line.png':'exec-161f8c34-5af5-4318-8d74-83ead3ed5f10.png','storyboard-reflection-run.png':'exec-8d45413e-30d3-4ef3-84fc-5a9854b84f05.png'}
for name,file in files.items():shutil.copy2(src/file,dest/name)
print('Saved',len(files),'generated images')
