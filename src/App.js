import React, {Component} from 'react';

export default class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        value0:1,
        value1:12
      };
    }

render () {
    console.log(document.cookie)
    return (
        <div style ={{height:200, width: 300, backgroundColor:'#ccc'}}>
            Hello World!
        </div>
        )
    }
}
