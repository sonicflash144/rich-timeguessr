import { spawn } from 'child_process';

export default (req, res) => {
  try {
    const { folderName } = req.body;
    const process = spawn('python', ['metadata.py', folderName]);
    let output = '';

    process.stdout.on('data', (data) => {
      output += data;
    });

    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    process.on('close', (code) => {
      if (code !== 0) {
        res.status(500).json({ error: `Script exited with code ${code}` });
      } else {
        res.json({ output });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};