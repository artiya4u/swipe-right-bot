function swipeLeft() {
  let bnt = document.querySelector("button[aria-label='Nope']");
  if (bnt) {
    bnt.click();
  }
}

function swipeRight(profileImageURL, why) {
  console.log("LIKE", profileImageURL, why);
  let bnt = document.querySelector("button[aria-label='Like']");
  if (bnt) {
    bnt.click();
  }
}

function processImage(apiKey, profileImageURL) {
  let data = {
    requests: [
      {
        image: {
          source: {
            imageUri: profileImageURL
          }
        },
        features: [
          {
            type: "LABEL_DETECTION"
          }
        ]
      }
    ]
  };
  let xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4 && this.status === 200) {

      let res = JSON.parse(this.responseText);
      let labels = res["responses"][0]["labelAnnotations"];
      if (labels === undefined) {
        swipeLeft();
        return;
      }
      let labelMap = {};
      for (let i = 0; i < labels.length; i++) {
        labelMap[labels[i]["description"]] = labels[i]["score"];
      }
      console.log(labelMap);
      if ("girl" in labelMap && labelMap["girl"] >= 0.6) {
        if ("gravure idol" in labelMap || "japanese idol" in labelMap) {
          // I don't like it.
          swipeLeft();
        } else if ("selfie" in labelMap) {
          // I don't like it.
          swipeLeft();
        } else if ("brassiere" in labelMap || "lingerie" in labelMap || "undergarment" in labelMap) {
          // I don't like it.
          swipeLeft();
        } else if ("beauty" in labelMap && labelMap["beauty"] >= 0.9) {
          // Definitely swipe right. Never miss this.
          swipeRight(profileImageURL, "beauty");
        } else if ("beauty" in labelMap && labelMap["beauty"] >= 0.8 &&
          "smile" in labelMap && labelMap["smile"] >= 0.8) {
          // smile!
          swipeRight(profileImageURL, 'smile');
        } else if ("beauty" in labelMap && labelMap["beauty"] >= 0.8 &&
          "hairstyle" in labelMap && labelMap["hairstyle"] >= 0.8) {
          // hairstyle!
          swipeRight(profileImageURL, 'hairstyle');
        } else if ("lady" in labelMap && labelMap["lady"] >= 0.8) {
          // lady!
          swipeRight(profileImageURL, 'lady');
        } else {
          if (Math.random() * 100 <= Math.PI) {
            swipeRight(profileImageURL, "lucky");
          } else {
            swipeLeft();
          }
        }
      } else {
        swipeLeft();
      }
    } else if (this.readyState === 4 && this.status !== 200) {
      console.log(this.status);
      console.log(this.responseText);
      swipeLeft();
    }
  });

  xhr.open("POST", "https://vision.googleapis.com/v1/images:annotate?key=" + apiKey);
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.setRequestHeader("cache-control", "no-cache");

  xhr.send(JSON.stringify(data));

}

chrome.storage.sync.get(null, function (items) {
  if (items.apiKey) {
    function mainLoop() {
      setTimeout(function () {
        let imageNode = document.querySelectorAll('#content > span > div > div.App__body.H\\28 100\\25 \\29.Pos\\28 r\\29.Z\\28 0\\29 > div > main > div.H\\28 100\\25 \\29 > div > div > div.recsCardboard.W\\28 100\\25 \\29.Mt\\28 a\\29.H\\28 100\\25 \\29 --s.Px\\28 10px\\29 --s > div > div.recsCardboard__cards.Expand.Animdur\\28 \\24 fast\\29.Animtf\\28 eio\\29.Pos\\28 r\\29.CenterAlign.Z\\28 1\\29 > div.recCard.Ov\\28 h\\29.Cur\\28 p\\29.W\\28 100\\25 \\29.Bgc\\28 \\24 c-placeholder\\29.StretchedBox.Bdrs\\28 8px\\29.CenterAlign--ml.Toa\\28 n\\29.active > div.Expand.D\\28 f\\29.tappable-view > div.Animdur\\28 \\24 fast\\29.Animtf\\28 eio\\29.tappable_recCard.Expand.Pos\\28 a\\29 > div > div:nth-child(1) > div > div')[0];
        if (imageNode) {
          let imgUrl = imageNode.style.backgroundImage;
          imgUrl = imgUrl.substring(
            imgUrl.indexOf("\"") + 1,
            imgUrl.lastIndexOf("\"")
          );
          processImage(items.apiKey, imgUrl);
        } else {
          console.log('Not found profile image, please refresh the page.');
        }
        mainLoop();
      }, 3800)
    }

    mainLoop();
  } else {
    alert("Please add Google Vision API key from extension options. Now using demo mode!!");

    function demoLoop() {
      setTimeout(function () {
        if (Math.random() <= 0.88) {
          swipeRight("N/A", "demo");
        } else {
          swipeLeft();
        }
        demoLoop();
      }, 2000)
    }

    demoLoop();
  }
});
