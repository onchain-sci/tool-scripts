import chalk from "chalk";
import { ethers } from "ethers";
import bip39 from "bip39";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { HDKey } from "micro-ed25519-hdkey";
import { appendFileSync } from "fs";
import { question } from "readline-sync";

const evmWalletGenerator = () => {
  const wallet = ethers.Wallet.createRandom();
  const privateKey = wallet.privateKey;
  const address = wallet.address;
  const mnemonic = wallet.mnemonic!.phrase;

  return { privateKey, mnemonic, address };
};

const solanaWalletGenerator = () => {
  const mnemonic = bip39.generateMnemonic();

  const seed = bip39.mnemonicToSeedSync(mnemonic, "");
  const hd = HDKey.fromMasterSeed(seed.toString("hex"));

  // with phantom wallet path
  const derivedKeyPair = Keypair.fromSeed(
    hd.derive("m/44'/501'/0'/0'").privateKey
  );
  const derivedStringPrivKey = bs58.encode(derivedKeyPair.secretKey);
  const derivedStringPubKey = derivedKeyPair.publicKey.toBase58();

  return {
    privateKey: derivedStringPrivKey,
    mnemonic,
    address: derivedStringPubKey,
  };
};

(async () => {
  try {
    const walletType = Number(
      question(
        chalk.yellow(
          "Choose wallet type you want to generate (1.EVM, 2.Solana): "
        )
      )
    );

    if (isNaN(walletType)) return;

    let inputNumber = Number(
      question(chalk.yellow("Input how much the wallet you want: "))
    );

    if (isNaN(inputNumber)) return;

    while (inputNumber-- > 0) {
      const createWalletResult =
        walletType == 1 ? evmWalletGenerator() : solanaWalletGenerator();

      // Append wallet details to result.txt
      appendFileSync(
        `./result-${walletType == 1 ? "evm" : "solana"}.txt`,
        `Address: ${createWalletResult.address} | Private Key: ${createWalletResult.privateKey} | Mnemonic: ${createWalletResult.mnemonic}\n`
      );
    }

    return;
  } catch (error) {
    console.log(
      chalk.red("Your program encountered an error! Message: " + error)
    );
  }
})();
