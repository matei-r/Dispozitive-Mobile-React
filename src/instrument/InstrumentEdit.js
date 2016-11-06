import React, {Component} from 'react';
import {Text, View, TextInput, ActivityIndicator} from 'react-native';
import {saveInstrument, cancelSaveInstrument} from './service';
import {registerRightAction, issueText, getLogger} from '../core/utils';
import styles from '../core/styles';
import Button from 'react-native-button';

const log = getLogger('InstrumentEdit');
const INSTRUMENT_EDIT_ROUTE = 'instrument/edit';

export class InstrumentEdit extends Component {
  static get routeName() {
    return INSTRUMENT_EDIT_ROUTE;
  }

  static get route() {
    return {name: INSTRUMENT_EDIT_ROUTE, title: 'Instrument Edit'};
  }

  constructor(props) {
    log('constructor');
    super(props);
    const nav = this.props.navigator;
    const currentRoutes = nav.getCurrentRoutes();
    const currentRoute = currentRoutes[currentRoutes.length - 1];
    if (currentRoute.data) {
      this.state = {instrument: {...currentRoute.data}, isSaving: false};
    } else {
      this.state = {instrument: {text: ''}, isSaving: false};
    }
  }

  render() {
    log('render');
    const state = this.state;
    let message = issueText(state.issue);
    return (
      <View style={styles.content}>
        { state.isSaving &&
        <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
        }
        <Text>Text</Text>
        <TextInput value={state.instrument.text} onChangeText={(text) => this.updateInstrumentText(text)}></TextInput>
        {message && <Text>{message}</Text>}
        <Text>
        {"\n"}
        </Text>
        <Button
        containerStyle={{padding:10, height:45, overflow:'hidden', borderRadius:4, backgroundColor: 'white'}}
        style={{fontSize: 20}}
        onPress={() => this.onSave()}>
        Save
        </Button>
      </View>
    );
  }

  componentDidMount() {
    log('componentDidMount');
    this._isMounted = true;
    const store = this.props.store;
    this.unsubscribe = store.subscribe(() => {
      log('setState');
      const state = this.state;
      const instrumentState = store.getState().instrument;
      this.setState({...state, issue: instrumentState.issue});
    });
  }

  componentWillUnmount() {
    log('componentWillUnmount');
    this._isMounted = false;
    this.unsubscribe();
    this.props.store.dispatch(cancelSaveInstrument());
  }

  updateInstrumentText(text) {
    let newState = {...this.state};
    newState.instrument.text = text;
    this.setState(newState);
  }

  onSave() {
    log('onSave');
    this.props.store.dispatch(saveInstrument(this.state.instrument)).then(() => {
      log('onInstrumentSaved');
      if (!this.state.issue) {
        this.props.navigator.pop();
      }
    });
  }
}
