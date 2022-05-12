import React from 'react';
import ProtocolData from './ProtocolData.js';
import UserData from './UserData.js';

export default class GeneralData extends React.Component {

    render(){
        return(
            <div className='GeneralDataContainer'>
                <div className="flux">General data </div>
                <div className='GeneralData'>
                    <ProtocolData requestManager={this.props.requestManager} />
                    <UserData requestManager={this.props.requestManager} />
                </div>
            </div>
        )
    }
}