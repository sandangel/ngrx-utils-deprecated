#! /usr/bin/env node

import { generateFileOutput, showUsage } from './printer';
const cmd = process.argv[2];

if ((cmd && cmd === 'g') || cmd === 'generate') {
  const generateType = process.argv[3];
  switch (generateType) {
    case 'a':
    case 'action': {
      const option = process.argv[4] === '-r' || process.argv[4] === '--reducer' ? true : false;
      const sourceFilePath = option ? process.argv[5] : process.argv[4];

      if (!sourceFilePath) {
        console.log('You must specify the path to action declaration file');
        process.exit(1);
      }
      generateFileOutput(sourceFilePath, option);
      break;
    }
    default: {
      showUsage();
    }
  }
} else {
  showUsage();
}
