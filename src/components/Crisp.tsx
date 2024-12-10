import React, { Component } from "react";

import { Crisp } from "crisp-sdk-web";

class CrispChat extends Component<{ websiteId: string }> {
  componentDidMount() {
    Crisp.configure(this.props.websiteId);
  }

  render() {
    return null;
  }
}

export default CrispChat;