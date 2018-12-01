function swipeLeft() {
  let bnt = document.querySelector("button[aria-label='Nope']");
  if (bnt) {
    bnt.click();
  }
}

function swipeRight(profileImageURL, labelMap) {
  console.log(profileImageURL, labelMap);
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
          swipeRight(profileImageURL, labelMap);
        } else if ("lady" in labelMap && labelMap["lady"] >= 0.8) {
          // Lady!
          swipeRight(profileImageURL, labelMap);
        } else if ("beauty" in labelMap && labelMap["beauty"] >= 0.8 &&
          "smile" in labelMap && labelMap["smile"] >= 0.8) {
          // smile!
          swipeRight(profileImageURL, labelMap);
        } else {
          if (Math.random() > 0.93) {
            swipeRight(profileImageURL, "Lucky one");
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
        let imageNode = document.querySelectorAll('.StretchedBox\\:\\:a')[1];
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
      }, 3000)
    }

    mainLoop();
  }
});