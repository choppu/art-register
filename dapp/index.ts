import "../node_modules/jodit/build/jodit.min.css"
import "./css/app.css";

const artArtifact = require("../artifacts/ArtItem.json");
const { ethers } = require("ethers");
const { Jodit } = require("jodit");
const IpfsHttpClient = require('ipfs-http-client');
const crypto = require('crypto');
const artContractAddress = '0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F';
const bgImg =  require("../dapp/img/bg.png");
const utf8Decoder = new TextDecoder('utf-8');
const WAValidator = require('@swyftx/api-crypto-address-validator');

let provider: any;
let signer: any;
let artContract: any;

export async function init() : Promise<void> {
  (window as any).ethereum.enable();
  provider = new ethers.providers.Web3Provider((window as any).ethereum);
  signer = provider.getSigner();
  artContract = new ethers.Contract(artContractAddress, artArtifact.abi, signer);

  let baseUrl = await artContract.baseURI();
  let ipfs = IpfsHttpClient({url: baseUrl});
  let registerArtPage = document.getElementById("create-art-page");
  let ownedArtsPage = document.getElementById("my-arts-page");
  let artPage = document.getElementById("my-art-page");

  await artContract.on("Art", (res: any) => {
    console.log(res);
  });

  if(registerArtPage) {
    registerArt(ipfs);
  } else if(ownedArtsPage) {
    getOwnedArts(signer, artContract, ipfs);
  } else if(artPage) {
    renderArt(artContract, ipfs);
  }
}

export async function registerArt(ipfs: any) : Promise<void> {
  let imgDefault = document.getElementById("art-img-default") as HTMLImageElement;
  let registerBtn = document.getElementById("register-btn");
  let title = document.getElementById("art-title") as HTMLInputElement;
  let author = document.getElementById("art-author") as HTMLInputElement;
  let date = document.getElementById("art-date") as HTMLInputElement;
  let certificate = document.getElementById("art-certificate") as HTMLInputElement;
  let thumb = document.getElementById("art-thumb") as HTMLInputElement;
  let description = document.getElementById("art-description") as HTMLTextAreaElement;
  let filePath = document.getElementById("file-path-label");
  let errorMsg = document.getElementById("error-msg");
  let today = new Date();
  let imgData: string;

  let editor = new Jodit(description, {
  "toolbarButtonSize": "small",
  "defaultMode": "1",
  "toolbarSticky": false,
  "showCharsCounter": false,
  "showXPathInStatusbar": false,
  "height": 270,
  "minHeight": 270,
  "buttons": ",,,,,,,,|,ul,ol,|,outdent,indent,|,font,fontsize,brush,paragraph,|,table,link,|,align,undo,redo,\n,selectall,cut,copy,paste,copyformat,|,hr,symbol,preview,find",
  "buttonsMD": "bold,,brush,paragraph,eraser,\n,align,|,undo,redo,|,dots",
  "buttonsSM": "bold,,brush,paragraph,eraser,\n,align,|,undo,redo,|,dots",
  "buttonsXS": ",|,brush,paragraph,eraser,\n,align,|,undo,redo,|,dots"
  });
  editor.value = '<p></p>';

  imgDefault.src = bgImg.default;

  thumb.addEventListener("change", async (e) => {
    imgData = await encodeThumb(thumb, imgDefault);
    filePath.innerHTML = thumb.value == "" ? "No file selected" : thumb.files[0].name;
    e.preventDefault();
  });

  date.value = today.toISOString().slice(0,10);

  registerBtn.addEventListener("click", async (e) => {
    let data = {
      name: title.value,
      author: author.value,
      date: date.value,
      image: imgData,
      description: description.value
    };

    let cid = await addToIPFS(ipfs, JSON.stringify(data), title.value);

    if (WAValidator.validate(certificate.value, 'eth') || certificate.value == '') {
      certificate.value ? await artContract.createArt(cid, certificate.value) : await artContract.createArt(cid, '0x00');
    } else {
      errorMsg.innerHTML = "Certificate is invalid. Please try again."
    }
    
    e.preventDefault();
  });
}

async function getOwnedArts(signer: any, contract: any, ipfs: any) : Promise<void> {
  let imgDefault = document.getElementById("my-arts-img-default") as HTMLImageElement;
  let signerAddr = await signer.getAddress();
  let ownedArts = await contract.tokensOfOwner(signerAddr);
  let list = document.getElementById("my-arts-list") as HTMLUListElement;
  
  imgDefault.src = bgImg.default;

  for(let i = 0; i < ownedArts.length; i++) {
    let dataJSON = await readArtMetadata(contract, ipfs, ownedArts[i]);
    renderOwnedArt(dataJSON, list, i, ownedArts[i], imgDefault, contract, signerAddr);
  }
}

async function renderArt(contract: any, ipfs: any) : Promise<void> {
  let artId = window.location.hash.slice(1);
  let data = await readArtMetadata(contract, ipfs, artId);
  let artImg = document.getElementById("art-meta-img") as HTMLImageElement;
  let artAuthor = document.getElementById("art-meta-author");
  let artName = document.getElementById("art-meta-name");
  let artCreation = document.getElementById("art-meta-creation");
  let artDetails = document.getElementById("meta-details-container");

  artImg.src = data.image;
  artAuthor.innerHTML = data.author;
  artName.innerHTML = data.name;
  artCreation.innerHTML = data.date.slice(0, data.date.indexOf("-"));
  artDetails.innerHTML = data.description;
}

async function addToIPFS(ipfs: any, data: any, fileName: string) : Promise<string> {
  let path = crypto.createHash('md5').update(fileName).digest('hex') + '.json';

  let file = {
    "path": path,
    "content": data
  }

  let content = await ipfs.add(file);
  return content.cid.string;
}

async function readArtMetadata(contract: any, ipfs: any, artId: number | string) : Promise<any> {
  let tokenUrl = await contract.tokenURI(artId);
  let cid = tokenUrl.slice(tokenUrl.lastIndexOf('/') + 1);
  let data = await readIPFSContent(ipfs, cid)
  return JSON.parse(data);
}

async function readIPFSContent(ipfs: any, cid: string) : Promise<string> {
  let stream = ipfs.cat(cid);
  let data = '';

  for await (const chunk of stream) {
    data += utf8Decoder.decode(chunk);
  }
  
  return data;
}

function renderOwnedArt(data: any, list: HTMLUListElement, i: number, artId: any, img: HTMLImageElement, contract: any, owner: any) : void {
  let art = document.createElement("li");
  let artIdString = artId.toString();

  let transferBtn = document.createElement("button");
  transferBtn.innerHTML = '&#xe040';
  transferBtn.classList.add("art__my-arts-btn");
  transferBtn.id = `art-${i}-transfer-btn`;
  transferBtn.dataset.artId = `${artIdString}`;

  art.addEventListener("mouseover", (e) => {
    img.src = data.image;
    e.preventDefault();
  });

  art.classList.add("art__my-arts-list-element");
  art.id = `art-${i}`;
  art.innerHTML = 
  `<span class="art__art-name art__my-arts-list-element-el">${data.name}</span>
  <span class="art__author-name art__my-arts-list-element-el">${data.author}</span>
  <a class="art__my-arts-btn art__art-view-link" href="art.html#${artId}" id="art-${i}-view-btn" data-art-id="${artIdString}">&#xe8f4</a>`;

  art.append(transferBtn);

  transferBtn.addEventListener("click", (e) => {
    transferArt(artId, contract, owner);
    e.preventDefault();
  });

  list.appendChild(art);  
}

async function transferArt(artId: any, contract: any, ownerAddress: any) : Promise<void> {
  let transferArtContainer = document.getElementById("transfer-container");
  let addressTo = document.getElementById("art-transfer-to") as HTMLInputElement;
  let transferBtn = document.getElementById("transfer-btn");

  transferArtContainer.classList.remove("art__display-none");
  transferArtContainer.classList.add("art__transfer-art-container");

  addressTo.addEventListener("input", (e) => {
    WAValidator.validate(addressTo.value, 'eth') ? transferBtn.removeAttribute("disabled") : transferBtn.setAttribute("disabled", "disabled");
    e.preventDefault();
  });

  transferBtn.addEventListener("click", async (e) => {
    await contract.transferFrom(ownerAddress, addressTo.value, artId);
    transferArtContainer.classList.add("art__display-none");
    transferArtContainer.classList.remove("art__transfer-art-container");
    e.preventDefault();
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      transferArtContainer.classList.add("art__display-none");
      transferArtContainer.classList.remove("art__transfer-art-container");
    } 
    e.preventDefault();
  })
}

async function encodeThumb(fileInput: HTMLInputElement, imgEl: HTMLImageElement) : Promise<any> {
  let thumbImg = fileInput.files;
  if (thumbImg.length > 0) {
    let imageFile = thumbImg[0];
    return await readImgFile(imageFile, imgEl);
  }
}

function readImgFile(file: File, imgEl: HTMLImageElement) : Promise<any> {
  return new Promise(function(resolve) {
    let reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
      let srcData = reader.result;
      imgEl.src = srcData as string;
    }
    reader.readAsDataURL(file);
  });
};

window.onload = init;
