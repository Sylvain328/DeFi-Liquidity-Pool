import React from 'react';

export default class DataContainer extends React.Component {
    
    render(){
        return(
            <div className={this.props.containerClass}>
                <span className='Indicator'>{this.props.indicatorTitle}</span><span>{this.props.indicatorValue} {this.props.indicatorUnit}</span>
            </div>
        )
    }
}