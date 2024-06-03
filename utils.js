import {exec} from "child_process"
import path from "path";
import { fileURLToPath } from "url";
import natural from "natural";
import nlp from "compromise";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const getCurrentTime = () => {
    let response = {};
    const time = new Date().toISOString();
    response = `It's currently ${time
      .split("T")[1]
      .slice(0, 8)} and the date is ${
      time.split("T")[0]
    }. Just wanted to keep you informed!`;
    return response;
}


const runCommand = async (query) => {
  const filePattern = /\b[\w-]+\.\w+\b/g;
  const matches = query.match(filePattern);

  console.log(matches)

  if (!matches) {
    console.log("No file names found in query");
  }else{
    const responses = await Promise.all(
      matches.map(async (file) => {
        console.log(file);
        let scriptPath = path.join(__dirname, file);
        const extension = path.extname(scriptPath).toLowerCase();
        let command;
        switch (extension) {
          case ".py":
            command = `python ${scriptPath}`;
            break;
          case ".js":
            command = `node ${scriptPath}`;
            break;
          default:
            console.log(`Unsupported file extension: ${extension}`);
        }
        return new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else if (stderr) {
              reject(stderr);
            } else {
              resolve(stdout);
            }
          });
        });
      })
    );
    responses.map((resp, i) => {
      return `File ${i} output: ` + resp;
    });
    let complete_response = "";
    responses.map((response) => (complete_response += response));
    return complete_response;
  }
};




export {getCurrentTime, runCommand}