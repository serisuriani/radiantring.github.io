import { loadGLTF } from "../ArGroup/libs/loader.js";
import { CSS3DObject } from '../ARGroup/libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js';

const THREE = window.MINDAR.IMAGE.THREE;
let mindarThreeInstance;

const createYoutube = (videoId) => {
  return new Promise((resolve, reject) => {
    if (typeof YT !== 'undefined' && typeof YT.Player === 'function') {
      resolve(new YT.Player('player', {
        videoId: videoId,
        events: {
          onReady: (event) => {
            resolve(event.target);
          }
        }
      }));
    } else {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        const player = new YT.Player('player', {
          videoId: videoId,
          events: {
            onReady: (event) => {
              resolve(event.target);
            }
          }
        });
      };
    }
  });
};

const startYouTubeAR = async (videoId, targetImage) => {
  try {
    const player = await createYoutube(videoId);

    mindarThreeInstance = new window.MINDAR.IMAGE.MindARThree({
      container: document.getElementById('ar-container'),
      imageTargetSrc: targetImage,
    });

    const { renderer, cssRenderer, scene, cssScene, camera } = mindarThreeInstance;

    const obj = new CSS3DObject(document.querySelector("#ar-div"));

    const cssAnchor = mindarThreeInstance.addCSSAnchor(0);
    cssAnchor.group.add(obj);

    cssAnchor.onTargetFound = () => {
      player.playVideo();
    };
    cssAnchor.onTargetLost = () => {
      player.pauseVideo();
    };

    await mindarThreeInstance.start();

    renderer.setAnimationLoop(() => {
      cssRenderer.render(cssScene, camera);
    });

  } catch (error) {
    console.error('Error starting YouTube AR', error);
  }
};

const youtubeBtns = document.querySelectorAll('.youtube-btn');

// Update with MindAR image target URL
const mindarImageTarget = '../ARGroup/assets/targets/venue.mind';

youtubeBtns.forEach((btn, index) => {
  btn.addEventListener('click', async () => {
    const videoId = btn.getAttribute('data-video-id');
    startYouTubeAR(videoId, mindarImageTarget).then(() => {
      console.log('YouTube AR started with video ID:', videoId);
    }).catch((error) => {
      console.error('Error starting YouTube AR', error);
    });
  });
});


