import React from 'react';
import PropTypes from 'prop-types';

export default class Tab extends React.Component {

  static propTypes = { activeTab: PropTypes.string.isRequired, label: PropTypes.string.isRequired };

  onClick = () => {
    const { label, onClick } = this.props;
    onClick(label);
  }

  render() {

    let className = 'Tab-list-item';

    if (this.props.activeTab === this.props.label) {
      className += ' Tab-list-active';
    }

    return (
      <li className={className} onClick={this.onClick}>
        {this.props.label}
      </li>
    );
  }
}
