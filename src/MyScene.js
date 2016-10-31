import React, { Component, PropTypes } from 'react';
import { View, Text, TouchableHighlight, StyleSheet } from 'react-native';

export default class MyScene extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    index: PropTypes.number.isRquired,
    onForward: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
  }

  readData() {
    return fetch('http://127.0.0.1/am/page.php',{
      method : 'GET',
      headers : {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify({
        page : this.props.index,
      })
    }).then((response) => response.json())
      .then((responseJSON) => {
        return responseJSON;
      })
      .catch((error) => {
        console.error(error);
      });
  }
  
  render() {
    return (
      <View>
        <Text style={styles.title}>{ this.props.title }</Text>
        <View style={styles.panel}>
        <TouchableHighlight onPress={this.props.onForward}>
          <Text style={styles.button}>Forward</Text>
        </TouchableHighlight>
          <Text> | </Text>
        <TouchableHighlight onPress={this.props.onBack}>
          <Text style={styles.button}>Back</Text>
        </TouchableHighlight>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  title : {
    textAlign : 'center',
    fontSize : 40,
  },
  panel : {
    flexDirection : 'row',
  },
  button : {
    fontSize : 20,
    backgroundColor : 'yellow'
  }
})
