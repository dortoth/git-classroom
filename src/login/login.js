#!/usr/bin/env node
import { program } from 'commander';

export function login(){
    program
    .name('gitClassroom')
    .description('The GIT Classroom CLI for easy use')
    .version('1.0.0');

    program
    .command('greet <name>')
    .description('Greet someone')
    .option('-l, --loud', 'Say it loudly')
    .action((name, options) => {
        let greeting = `Hello, ${name}!`;
        if (options.loud) {
            greeting = greeting.toUpperCase();
        }
        console.log(greeting);
    });

    program.parse();
}