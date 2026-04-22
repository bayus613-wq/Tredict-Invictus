const axios = require("axios");
const AdmZip = require("adm-zip");

async function deployToGitHub(repoName, fileBuffer, githubToken, githubUser) {
  try {
    await axios.post(
      "https://api.github.com/user/repos",
      { name: repoName, private: false },
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "User-Agent": "DeployBot"
        }
      }
    );
    const owner = githubUser;
    const zip = new AdmZip(fileBuffer);
    const zipEntries = zip.getEntries();
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue; 
      const filePath = entry.entryName;
      const fileContent = entry.getData();
      const base64Content = fileContent.toString("base64");

      const uploadUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`;

      await axios.put(
        uploadUrl,
        {
          message: `Upload ${filePath}`,
          content: base64Content
        },
        {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            "User-Agent": "DeployBot"
          }
        }
      );
    }
    return {
      success: true,
      url: `https://github.com/${owner}/${repoName}`
    };

  } catch (err) {
    console.error("deployToGitHub ERROR:", err.response?.data || err);
    return { success: false };
  }
}

module.exports = deployToGitHub;