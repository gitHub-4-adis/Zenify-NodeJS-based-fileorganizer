#!/usr/bin/env node
/**
 * ZENIFY - A FILE ORGANIZER BASED CMD LINE UTILITY
 * 3 cmds: help, tree, organize
 * 
*/
import fs from "fs";
import path from "path";
import filetypes from './utils.js';


const args = process.argv[2];
if(args === "--help") {
    // help utility
    help();

} else if(args === "--tree") {
    // tree utility
    const cwd = process.cwd();
    if(fs.existsSync(cwd)) {
        console.log(`└───${path.parse(cwd).base}📂`);
        tree(cwd, "         ");

    } else {
        console.log(`>>> Please use the zenfify cmd line tool with a valid directory⚠️`);
    }

} else if(args === "--organize") {
    // organizer utility
    organize();

} else {
    console.log(`>>> Please enter a valid option or type --help for a quick manual⚠️`);
}


function tree(currentDir, pad) {
    const items = fs.readdirSync(currentDir);
    for(let i=0; i < items.length; i++) {
        const fullpath = path.join(currentDir, items[i]);
        if(fs.lstatSync(fullpath).isDirectory()) {
            console.log(`${pad}└───${items[i]}📁`);
            tree(path.join(currentDir, items[i]), pad + "      ");

        } else {
            console.log(`${pad}├───${items[i]}📄`);
        }
    }
}


function organize() {
    // 1.read cwd ✅
    const cwd = process.cwd();
    const items = fs.readdirSync(cwd);
    let mapFileToType = {};

    // 2.loop thru each item. if folderthen ignore ✅
    for(let i = 0; i < items.length; i++) {
        const fullpath = path.join(cwd, items[i]);
        const parsed = path.parse(fullpath);
        
        // 3.chk if path is valid. if it is then proceed else continue ✅
        if(fs.existsSync(fullpath) === true) {
            
            if(fs.lstatSync(fullpath).isFile()) {
                // 4.if category folder exists then just copy the file to this folder and delete original file ✅
                const curExt = parsed.ext.substring(1);
                if(mapFileToType.hasOwnProperty(curExt)) {
                    fs.copyFileSync(
                        fullpath,
                        path.join(cwd, mapFileToType[curExt], parsed.base)
                    );

                } else {
                    // 5.create caategory folder if does not exist ✅
                    for(let key in filetypes) {
                        if(putFileInsideParentFolder(
                            filetypes, mapFileToType, 
                            key, curExt, cwd, fullpath, parsed) === true) {
                                console.log(mapFileToType);
                            break;
                        };
                    }
                }
                // remove the file from src iff it is successfully copied to destination folder
                if(mapFileToType.hasOwnProperty(curExt) && 
                    fs.existsSync(path.join(cwd, mapFileToType[curExt], parsed.base)) === true) {
                    fs.unlinkSync(fullpath);

                } else {
                    console.log('could not copy: ', parsed.base);
                }
            } 

        } else {
            continue;
        }
    }
}


function putFileInsideParentFolder(filetypes, mapFileToType, key, curExt, cwd, fullpath, parsed) {
    for(let i = 0; i < filetypes[key].length; i++) {
        if(filetypes[key].indexOf(curExt) >= 0) {
            if(fs.existsSync(path.join(cwd, key)) === false) {
                fs.mkdirSync(path.join(cwd, key));
            }
            fs.copyFileSync(
                fullpath, 
                path.join(cwd, key, parsed.base)
            );
            // 6.store which file types hv already been copied. if same type of file encountered
            // again then simply copy it to parent folder like in step 4 ✅
            mapFileToType[curExt] = key;
            break;   
        }
    }
    return (mapFileToType.hasOwnProperty(parsed.ext) === true)? true: false;
}


function help() {
    console.log(
        `Usage:
    ✅ zenify --tree       lists the directory structure in a heirarchical visual
    ✅ zenify --organize   organizes same type of files in the current directory in separate folders
    ✅ zenify --help       quick manual for reference
    `);
}