import "./css/app.css";

const artArtifact = require("../artifacts/ArtItem.json");
const { ethers } = require("ethers");
const WAValidator = require('@swyftx/api-crypto-address-validator');

const IpfsHttpClient = require('ipfs-http-client');
const ipfs = IpfsHttpClient({url: 'http://127.0.0.1:5001'});
const crypto = require('crypto');

let provider;
let signer;

export async function init() : Promise<void> {
  (window as any).ethereum.enable();
  provider = new ethers.providers.Web3Provider((window as any).ethereum);
  signer = provider.getSigner();

  let factory = new ethers.ContractFactory(artArtifact.abi, artArtifact.bytecode, signer);
  let registerArtPage = document.getElementById("create-art-page");

  if(registerArtPage) {
    registerArt(provider, signer);
  }
}

export async function registerArt(provider: any, signer: any) : Promise<void> {
  let registerBtn = document.getElementById("register-btn");
  let title = document.getElementById("art-title") as HTMLInputElement;
  let author = document.getElementById("art-author") as HTMLInputElement;
  let date = document.getElementById("art-date") as HTMLInputElement;
  let thumb = document.getElementById("art-thumb") as HTMLInputElement;
  let description = document.getElementById("art-description") as HTMLTextAreaElement;
  let formElements = document.getElementsByClassName("art__form-item");

  registerBtn.addEventListener("click", async (e) => {
    let data = JSON.stringify({
      title: title.value,
      author: author.value,
      date: date.value,
      thumb: thumb.value,
      description: description.value
    });

    let path = crypto.createHash('md5').update(title.value).digest('hex') + '.json';

    let file = {
      "path": path,
      "content": data
    }

    let content = await ipfs.add(file);
    
    e.preventDefault();
  });

  for await (const chunk of ipfs.cat("QmPLKXmzUsrqSQfUGFau8coEMffudqfA8mEBtZEmzFTyhN")) {
    console.log(String.fromCharCode.apply(null, chunk));
  }
}

window.onload = init;
