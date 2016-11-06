import React, {Component} from 'react';
import {ListView, Text, View, StatusBar, ActivityIndicator} from 'react-native';
import {InstrumentEdit} from './InstrumentEdit';
import {InstrumentView} from './InstrumentView';
import {loadInstruments, cancelLoadInstruments} from './service';
import {registerRightAction, getLogger, issueText} from '../core/utils';
import styles from '../core/styles';
import Button from 'react-native-button';

const log = getLogger('InstrumentList');
const INSTRUMENT_LIST_ROUTE = 'instrument/list';

export class InstrumentList extends Component {
  static get routeName() {
    return INSTRUMENT_LIST_ROUTE;
  }

  static get route() {
    return {name: INSTRUMENT_LIST_ROUTE, title: 'Instrument List'};
  }

  constructor(props) {
    super(props);
    log('constructor');
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
    const instrumentState = this.props.store.getState().instrument;
    this.state = {isLoading: instrumentState.isLoading, dataSource: this.ds.cloneWithRows(instrumentState.items)};
  }

  render() {
    log('render');
    let message = issueText(this.state.issue);
    return (
      <View style={styles.content}>
        { this.state.isLoading &&
        <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
        }
        {message && <Text>{message}</Text>}
        <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={instrument => (<InstrumentView instrument={instrument} onPress={(instrument) => this.onInstrumentPress(instrument)}/>)}/>
          <Text>
          {"\n"}
          </Text>
          <Button
          containerStyle={{padding:10, height:45, overflow:'hidden', borderRadius:4, backgroundColor: 'white'}}
          style={{fontSize: 20}}
          onPress={() => this.onNewInstrument()}>
          Add
          </Button>
      </View>
    );
  }

  onNewInstrument() {
    log('onNewInstrument');
    this.props.navigator.push({...InstrumentEdit.route});
  }

  onInstrumentPress(instrument) {
    log('onInstrumentPress');
    this.props.navigator.push({...InstrumentEdit.route, data: instrument});
  }

  componentDidMount() {
    log('componentDidMount');
    this._isMounted = true;
    const store = this.props.store;
    this.unsubscribe = store.subscribe(() => {
      log('setState');
      const state = this.state;
      const instrumentState = store.getState().instrument;
      this.setState({dataSource: this.ds.cloneWithRows(instrumentState.items), isLoading: instrumentState.isLoading});
    });
    store.dispatch(loadInstruments());
  }

  componentWillUnmount() {
    log('componentWillUnmount');
    this._isMounted = false;
    this.unsubscribe();
    this.props.store.dispatch(cancelLoadInstruments());
  }
}
