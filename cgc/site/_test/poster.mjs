import {chromium} from 'playwright';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:1000}});await p.goto('http://127.0.0.1:4173/');await p.waitForTimeout(2500);await p.locator('#scene').screenshot({path:'../../_work/boarded.png'});await b.close();
