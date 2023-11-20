class Utilities {
  static string(x, xDefault) {
    return typeof x === 'string' ? x : xDefault;
  }

  static positiveInteger(x, xDefault) {
    return Number.isInteger(x) && x > 0 ? x : xDefault;
  }
}


class DomController {
  static removeChildren(element) {
    while (element.hasChildNodes()) {
      element.lastChild.remove();
    }
  }

  static displayImages(urls, parent) {
    urls.forEach((url) => {
      const img = document.createElement('img');
      img.src = url;
      parent.appendChild(img);
    });
  }

  static getKeyElement() {
    return document.getElementById('api-key').children[1];
  }

  static getImageDescriptionElement() {
    return document.getElementById('image-description').children[1];
  }

  static getSubmitElement() {
    return document.getElementById('submit').children[0];
  }

  static getImageDescriptionElement() {
    return document.getElementById('image-description').children[1];
  }

  static getResultsContainerElement() {
    return document.getElementById('results-container');
  }
}


class RestController {
  static post(url, payload, token) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const result = RestController.createPromiseForHttpResponse(xhr);
    xhr.send(JSON.stringify(payload));
    return result;            
  }

  static createPromiseForHttpResponse(xhr) {
    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          resolve(xhr.responseText);
        }
      };
    });
  }
}


class OpenaiApi {
  static createImage(key, params) {
    return RestController.post(
      OpenaiApi.getImageCreationUrl(),
      {
        model:   Utilities.string(params.model, 'dall-e-3'),
        prompt:  Utilities.string(params.prompt, 'Rain of love'),
        n:       Utilities.positiveInteger(params.n, 1),
        size:    Utilities.string(params.size, '1024x1024'),
        quality: Utilities.string(params.quality, 'hd'),
        style:   Utilities.string(params.style, 'natural'),
      },
      key
    )
    .then(JSON.parse)
    .then((response) => response.data.map((image) => image.url));
  }

  static getImageCreationUrl() {
    return 'https://api.openai.com/v1/images/generations';
  }
}


class OpenaiBrowserClient {
  static async createAndDisplayImage() {
    const resultsContainer = DomController.getResultsContainerElement();
    DomController.removeChildren(resultsContainer);

    const submit = DomController.getSubmitElement();
    submit.disabled = true;

    const key = DomController.getKeyElement().value;
    const prompt = DomController.getImageDescriptionElement().value;
    await OpenaiApi.createImage(key, { prompt })
      .then((urls) => DomController.displayImages(urls, resultsContainer))
      .then(() => submit.disabled = false);
  }
}


class App {
  static async start() {
    OpenaiBrowserClient.createAndDisplayImage();
  }
}
