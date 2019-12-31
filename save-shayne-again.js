#!/usr/bin/env node
'use strict';

const bip39 = require('bip39');
const bip44 = require('bip44');
const hdkey = require('hdkey');
const bs58check = require('bs58check');
const createHash = require('create-hash');
const { argv } = require('yargs');
const { bufferToHex } = require('ethereumjs-util');

const toAddress = (key) => {
	const step1 = key._publicKey;
  const step2 = createHash('sha256').update(step1).digest();
  const step3 = createHash('rmd160').update(step2).digest();
  const step4 = Buffer.allocUnsafe(21);
  step4.writeUInt8(0x00, 0);
  step3.copy(step4, 1);
  const step9 = bs58check.encode(step4);
	console.log(step9);
	return step9;
};

(async () => {
	const seed = await bip39.mnemonicToSeed(argv._.join(' '));
	console.log('looking for: ' + argv.l);
  console.log('shaynes seed: ' + bufferToHex(seed));
	const root = hdkey.fromMasterSeed(seed);
	let i = 0;
	while (true) {
		const derivedExternal = root.derive("m/44'/0'/" + String(i >>> 8) + "'/0/" + String(i & 0xff));
		const derivedChild = root.derive("m/44'/0'/" + String(i >>> 8) + "'/1/" + String(i & 0xff));
		let found;
		if ((found = [ [ toAddress(derivedExternal), derivedExternal._privateKey ], [ toAddress(derivedChild), derivedChild._privateKey ] ].find(([ target ]) => target === argv.l))) {
			console.log('look whos a lucky fuck');
			console.log('private key for ' + found[0] + ' is ' + bufferToHex(found[1]));
			process.exit(0);
		}
		i++;
		if (i === 1 << 16) process.exit(0);
	}
})().catch((err) => console.log(err.stack));

