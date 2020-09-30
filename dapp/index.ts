import "./css/app.css";

const artArtifact = require("../artifacts/ArtItem.json");
const { ethers } = require("ethers");
const WAValidator = require('@swyftx/api-crypto-address-validator');

const IpfsHttpClient = require('ipfs-http-client');
const ipfs = IpfsHttpClient({url: 'http://127.0.0.1:5001'});
const crypto = require('crypto');
const artContractAddress = '0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F';
let provider: any;
let signer: any;
let artContract: any;

export async function init() : Promise<void> {
  (window as any).ethereum.enable();
  provider = new ethers.providers.Web3Provider((window as any).ethereum);
  signer = provider.getSigner();
  artContract = new ethers.Contract(artContractAddress, artArtifact.abi, signer);
  let registerArtPage = document.getElementById("create-art-page");
  //let factory = new ethers.ContractFactory(artArtifact.abi, artArtifact.bytecode, signer);

  await artContract.on("Art", (res: any) => {
    console.log(res);
  });

  if(registerArtPage) {
    registerArt();
  }
}

export async function registerArt() : Promise<void> {
  let bgImg =  require("../dapp/img/bg.png");
  let imgDefault = document.getElementById("art-img-default") as HTMLImageElement;
  let registerBtn = document.getElementById("register-btn");
  let title = document.getElementById("art-title") as HTMLInputElement;
  let author = document.getElementById("art-author") as HTMLInputElement;
  let date = document.getElementById("art-date") as HTMLInputElement;
  let thumb = document.getElementById("art-thumb") as HTMLInputElement;
  let description = document.getElementById("art-description") as HTMLTextAreaElement;
  let filePath = document.getElementById("file-path-label");
  let today = new Date();
  let imgData: string;

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

    let cid = await addToIPFS(JSON.stringify(data), title.value);
    await artContract.createArt(cid);
    e.preventDefault();
  });
}

async function addToIPFS(data: any, fileName: string) : Promise<string> {
  let path = crypto.createHash('md5').update(fileName).digest('hex') + '.json';

  let file = {
    "path": path,
    "content": data
  }

  let content = await ipfs.add(file);
  return content.cid.string;
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
