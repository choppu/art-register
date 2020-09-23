import "./css/app.css";

const artArtifact = require("../artifacts/ArtItem.json");
const { ethers } = require("ethers");
const WAValidator = require('@swyftx/api-crypto-address-validator');

const IpfsHttpClient = require('ipfs-http-client');
const ipfs = IpfsHttpClient({url: 'http://127.0.0.1:5001'});

let provider;
let signer;

export async function init() : Promise<void> {
  (window as any).ethereum.enable();
  provider = new ethers.providers.Web3Provider((window as any).ethereum);
  signer = provider.getSigner();

  let factory = new ethers.ContractFactory(artArtifact.abi, artArtifact.bytecode, signer);
  deployArtContract(factory);
}

export async function deployArtContract(factory: any) : Promise<void> {
}

window.onload = init;
