import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableHighlight} from 'react-native';
import CheckBox from 'react-native-check-box';

export class InstrumentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected : 0
    };
  }

  clicked(isChecked){
    if(!isChecked){
      this.setState({selected : this.state.selected + 1});
      this.isChecked = true;
    } else {
      this.setState({selected : this.state.selected - 1});
      this.isChecked = false;
    }
  }

  render() {
    return (
      <TouchableHighlight onPress={() => this.props.onPress(this.props.instrument)}>
        <View style={{flexDirection: 'row'}}>
          <CheckBox
            style={{flex:1,padding:10}}
            onClick={(isChecked)=>this.clicked(this.isChecked)}
            isChecked={false}
            leftText={this.props.instrument.text}
          />
          <Text>{this.state.selected}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  listItem: {
    margin: 10,
  }
});
