import axios from 'axios';
import { GITLAB_LOGIN } from '../config/config.js';

export class GitLabService {
  //-------------- GitLab Login --------------------
  async requestGitLabToken(deviceCode: string) {
    // GitLab antwortet bei "authorization_pending" mit einem Fehlerstatus.
    // Darum keine Exception werfen, sondern pollForToken entscheiden lassen.
    const response = await axios.post(
      GITLAB_LOGIN.tokenUrl,
      {
        client_id: GITLAB_LOGIN.clientId,
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
      GITLAB_LOGIN.deviceCodeUrl,
      { client_id: GITLAB_LOGIN.clientId },
      { headers: { Accept: 'application/json' } },
    );
    return res.data;
  }

  // ----------- GitLab Menu ------------------
  async loadExistingGitLabGroup() {
    //TODO
  }
}
