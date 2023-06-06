const puppeteer = require("puppeteer");
const { urlIs } = require("selenium-webdriver/lib/until");
const jsonData = require("./data.json");
const fs = require('fs');


function sleepSync(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}

async function downloadPdf(page, data, certificateNumber) {

  await page.evaluate(async ({ page, data, certificateNumber }) => {
    const cname = await document.querySelector('.cname');
    // const cclass = await document.querySelector('.cclass');
    // console.log('3' + cclass)
    const partnerlogo = await document.querySelector('.partnerlogo');
    const cid = await document.querySelector('#cid');

    cname.innerHTML = data['FULL_NAME'];

    // cclass.innerHTML = data['Std'];
    // console.log('7')

    partnerlogo.setAttribute('src', "/images/channelpartners/" + "snk")
    cid.innerHTML = certificateNumber;

  }, { page, data, certificateNumber });



  const path1 = `./pdfs/${data['FULL_NAME']} - Cyber Smart.pdf`

  await page.pdf({ path: path1, format: 'letter' })
  // , landscape: true
  // section screenshot print-w/print-certifi
  console.log("download complete")
}


function javascript_abort() {
  throw new Error('This is not an error. This is just to abort javascript');
}

async function writeData(info, certificateNumber) {
  fs.appendFileSync('data.csv', '\n' + info.FULL_NAME + ',' + info.Std + ',' + certificateNumber);
  console.log("writing data complete")
}

async function remainingWrite(remainingjson) {
  fs.writeFileSync("remaining.json", JSON.stringify(remainingjson));
  console.log("writing remaining data complete")
}

const answer = async (page, arr) => {

  let j = 0;
  // console.log("function called")
  for (let i = 0; i < 5; i++) {
    // console.log(`stage ${i + 1}`)
    for (j = 0; j < 5; j++) {
      // console.log(`question ${j+1}`)
      // console.log(`ans = ${arr[i][j]}`)

      await page.click(`html > body> section:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > ul > li:nth-of-type(${arr[i][j]}) > a`);
      // console.log("answer clicked")
      // await sleepSync(100);
      await page.click("body > section.main-conrainer.scrolly > div.main-contant-div.vcenter > div > div > div > div > div.answer-footer.correct-answer.next1.nextI > div > div > div.col-md-6.col-lg-6.awesomebtn > button");
      // console.log("next clicked")
    }

    if (j != 4) {
      await page.goto("https://cybersmart.wnscaresfoundation.org/Students/correctanswer");
    }
    else {
      await page.click("body > section.main-conrainer.yesScroll > div.main-contant-div.vcenter > div > div > div > div > div.card-body.pc-10p.position-relative > div.journeybtn > button");
    }

  }

}


(async () => {

  const browser = await puppeteer.launch({
    args: ['--mute-audio'],
    headless: true,
  });

  // defaultViewport: {
  //  width: 1300, height: 600,
  // },

  let ans24 = [
    [1, 2, 4, 3, 2],
    [3, 3, 1, 2, 1],
    [2, 1, 1, 1, 2],
    [1, 2, 1, 2, 2],
    [2, 2, 1, 1, 2]
  ];

  let ans58 = [
    [1, 4, 2, 2, 2],
    [1, 3, 2, 1, 1],
    [2, 2, 1, 2, 1],
    [4, 1, 1, 2, 3],
    [1, 2, 2, 1, 4]
  ];

  let ans8u = [
    [],
    [],
    [],
    [],
    []
  ];

  let cookie = true;

  var remainingjson = [];

  let progress = 1;
  let errCount = 1;

  for (let data of jsonData) {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(5000);

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = page.url();
      if (url == "https://cybersmart.wnscaresfoundation.org/Students/Medal") {
        req.continue();
      }
      else if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
        req.abort();
      } else {
        req.continue();
      }
    });

    // await page.setRequestInterception(true);
    // page.on('request', (req) => {
    //   if (req.resourceType() === 'image') {
    //     req.abort();
    //   }
    //   else {
    //     req.continue();
    //   }
    // });
    try {
      await page.goto("https://cybersmart.wnscaresfoundation.org");

      const p1country = await page.$("#Country");
      await p1country.select("1");

      await page.waitForNavigation();

      await page.click("body > section.main-conrainer.NoScroll > div.main-contant-div.vcenter > div > div > div:nth-child(2) > div > div > form > div.enterbtn > button");
      console.log()
      //console.log(data)
      console.log("progress: " + progress++)
      await page.waitForNavigation();

      await sleepSync(1000)
      const p2name = await page.$("#Name");
      await p2name.type(data["FULL_NAME"]);

      const p2class = await page.$("#SelectedClassName");
      await p2class.select(data['Std']);
      // console.log("class selected")

      await sleepSync(500)

      const p2state = await page.$("#SelectedLocationName");
      p2state.select("Maharashtra").then(function (a, b) {
        // console.log(a, b)
      }).catch(function (e) {
        console.log("error in catch", e)
      })


      // console.log("state selected")
      await sleepSync(500)

      const p2cp = await page.$("#PartnerShortCode");
      p2cp.select("snk").then(function (a, b) {
        // console.log(a, b)
      }).catch(function (e) {
        console.log("error in snk", e)
      })


      await page.click("body > section.main-conrainer > div.main-contant-div.vcenter > div > div > div.col-lg-7.col-md-12 > div > div > form > div.enterbtn > button");


      await page.waitForNavigation();

      await page.click("body > section.main-conrainer > div.main-contant-div.vcenter > div > div > div > div > div > div > a");

      await page.goto("https://cybersmart.wnscaresfoundation.org/Students/correctanswer");

      if (data['Std'] === "2-4") {
        await answer(page, ans24);
      }
      else if (data['Std'] === "5-7") {
        await answer(page, ans58);
      }
      else {
        await answer(page, ans8u);
      }

      const ref = await page.$("#rid")
      const refId = await (await ref.getProperty('textContent')).jsonValue()
      //  console.log("reference ID is: " + refId)

      if (cookie) {
        await page.click("#cookieConsent > button");
        cookie = false;
      }

      await writeData(data, refId);
      await downloadPdf(page, data, refId);

    } catch (error) {
      // console.log(error)
      //console.log("error")
      // var obj = {
      //   'FULL_NAME': data['FULL_NAME'],
      //   'Std': data['Std']
      // }
      remainingjson.push(data)
      //console.log(remainingjson)
      console.log("Error count: " + errCount++)
      // write code to store data in json

    }
    await page.close();
  }


  try {
    await remainingWrite(remainingjson);
  } catch (error) {
    console.log(error);
    await page.waitForNavigation();
  }

  await browser.waitForTarget(() => false);

  await browser.close();
})();






