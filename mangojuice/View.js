import React from 'react';

export class ViewWrapper extends React.Component {
  componentWillMount() {
    const { meta } = this.props;
    this.stopLocal = meta.onLocalUpdate(this.updateView);
    this.stopGlobal = meta.shared.onGlobalUpdate(this.updateView);
  }
  componentWillUnmount() {
    this.stopLocal.stop();
    this.stopGlobal.stop();
  }
  shuoldComponentUpdate() {
    return false;
  }
  updateView = () => {
    this.forceUpdate();
  };
  render() {
    const { View, meta, nest, exec } = this.props;
    return (
      <View
        model={meta.model}
        shared={meta.sharedModel}
        nest={nest}
        exec={exec}
      />
    );
  }
}
