/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AppRegistry, Navigator, Text, View } from 'react-native';

import MyScene from './src/MyScene';

class Lab_React extends Component {
  render() {
    return (
      <Navigator
        initialRoute={{ title: 'Index', index: 0 }}
        renderScene={(route, navigator) =>
          <MyScene
            title={route.title}
            index={route.index}

            onForward={ () => {
              const nextIndex = route.index + 1;
              navigator.push({
                title: 'Scene ' + nextIndex,
                index: nextIndex,
              });
            }}

            onBack={() => {
              if (route.index > 0) {
                navigator.pop();
              }
            }}
          />
        }
      />
    )
  }
}

AppRegistry.registerComponent('Lab_React', () => Lab_React);
