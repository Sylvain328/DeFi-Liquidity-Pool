import React from 'react';

export default class DataContainer extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async () => {
    }

    render(){
        return(
            <div className={this.props.containerClass}>
                <span className='Indicator'>{this.props.indicatorTitle}</span><span>{this.props.indicatorValue} {this.props.indicatorUnit}</span>
            </div>
        )
    }
}