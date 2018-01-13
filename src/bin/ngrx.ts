#! /usr/bin/env node

import { generateAction, showUsage } from './printer';
const cmd = process.argv[2];

if ((cmd && cmd === 'g') || cmd === 'generate') {
  const generateType = process.argv[3];
  switch (generateType) {
    case 'a':
    case 'action': {
      const sourceFilePath = process.argv[4];
      generateAction(sourceFilePath);
      break;
    }
    default: {
      showUsage();
    }
  }
} else {
  showUsage();
}
