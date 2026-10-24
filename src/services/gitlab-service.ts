import axios from 'axios';
import { CLIENT_ID_GITLAB } from '../config/config.js';

export class GitLabService {
  //-------------- GitLab Login --------------------
  async requestGitLabToken(deviceCode: string) {
    // GitLab antwortet bei "authorization_pending" mit einem Fehlerstatus.
    // Darum keine Exception werfen, sondern pollForToken entscheiden lassen.
    const response = await axios.post(
      'https://gitlab.com/oauth/token',
      {
        client_id: CLIENT_ID_GITLAB,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      },
      {
        headers: { Accept: 'application/json' },
        validateStatus: () => true,
      },
    );

    return response.data;
  }

  async gitlabLoginApi() {
    const res = await axios.post(
      'https://gitlab.com/oauth/authorize_device',
      { client_id: CLIENT_ID_GITLAB },
      { headers: { Accept: 'application/json' } },
    );
    return res.data;
  }

  // ----------- GitLab Menu ------------------
  async loadExisitingGitLabGroup() {
    //TODO
  }
}
