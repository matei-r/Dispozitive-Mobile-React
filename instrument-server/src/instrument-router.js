import {
  OK, NOT_FOUND, LAST_MODIFIED, NOT_MODIFIED, BAD_REQUEST, ETAG,
  CONFLICT, METHOD_NOT_ALLOWED, NO_CONTENT, CREATED, setIssueRes
} from './utils';
import Router from 'koa-router';
import {getLogger} from './utils';

const log = getLogger('instrument');

let instrumentsLastUpdateMillis = null;

export class InstrumentRouter extends Router {
  constructor(props) {
    super(props);
    this.instrumentStore = props.instrumentStore;
    this.io = props.io;
    this.get('/', async(ctx) => {
      let res = ctx.response;
      let lastModified = ctx.request.get(LAST_MODIFIED);
      if (lastModified && instrumentsLastUpdateMillis && instrumentsLastUpdateMillis <= new Date(lastModified).getTime()) {
        log('search / - 304 Not Modified (the client can use the cached data)');
        res.status = NOT_MODIFIED;
      } else {
        res.body = await this.instrumentStore.find({});
        if (!instrumentsLastUpdateMillis) {
          instrumentsLastUpdateMillis = Date.now();
        }
        res.set({[LAST_MODIFIED]: new Date(instrumentsLastUpdateMillis)});
        log('search / - 200 Ok');
      }
    }).get('/:id', async(ctx) => {
      let instrument = await this.instrumentStore.findOne({_id: ctx.params.id});
      let res = ctx.response;
      if (instrument) {
        log('read /:id - 200 Ok');
        this.setInstrumentRes(res, OK, instrument); //200 Ok
      } else {
        log('read /:id - 404 Not Found (if you know the resource was deleted, then you can return 410 Gone)');
        setIssueRes(res, NOT_FOUND, [{warning: 'Instrument not found'}]);
      }
    }).post('/', async(ctx) => {
      let instrument = ctx.request.body;
      let res = ctx.response;
      if (instrument.text) { //validation
        await this.createInstrument(res, instrument);
      } else {
        log(`create / - 400 Bad Request`);
        setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]);
      }
    }).put('/:id', async(ctx) => {
      let instrument = ctx.request.body;
      let id = ctx.params.id;
      let instrumentId = instrument._id;
      let res = ctx.response;
      if (instrumentId && instrumentId != id) {
        log(`update /:id - 400 Bad Request (param id and body _id should be the same)`);
        setIssueRes(res, BAD_REQUEST, [{error: 'Param id and body _id should be the same'}]);
        return;
      }
      if (!instrument.text) {
        log(`update /:id - 400 Bad Request (validation errors)`);
        setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]);
        return;
      }
      if (!instrumentId) {
        await this.createInstrument(res, instrument);
      } else {
        let persistedInstrument = await this.instrumentStore.findOne({_id: id});
        if (persistedInstrument) {
          let instrumentVersion = parseInt(ctx.request.get(ETAG)) || instrument.version;
          if (!instrumentVersion) {
            log(`update /:id - 400 Bad Request (no version specified)`);
            setIssueRes(res, BAD_REQUEST, [{error: 'No version specified'}]); //400 Bad Request
          } else if (instrumentVersion < persistedInstrument.version) {
            log(`update /:id - 409 Conflict`);
            setIssueRes(res, CONFLICT, [{error: 'Version conflict'}]); //409 Conflict
          } else {
            instrument.version = instrumentVersion + 1;
            instrument.updated = Date.now();
            let updatedCount = await this.instrumentStore.update({_id: id}, instrument);
            instrumentsLastUpdateMillis = instrument.updated;
            if (updatedCount == 1) {
              this.setInstrumentRes(res, OK, instrument); //200 Ok
              this.io.emit('instrument-updated', instrument);
            } else {
              log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
              setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Instrument no longer exists'}]); //
            }
          }
        } else {
          log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
          setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Instrument no longer exists'}]); //Method Not Allowed
        }
      }
    }).del('/:id', async(ctx) => {
      let id = ctx.params.id;
      await this.instrumentStore.remove({_id: id});
      this.io.emit('instrument-deleted', {_id: id})
      instrumentsLastUpdateMillis = Date.now();
      ctx.response.status = NO_CONTENT;
      log(`remove /:id - 204 No content (even if the resource was already deleted), or 200 Ok`);
    });
  }

  async createInstrument(res, instrument) {
    instrument.version = 1;
    instrument.updated = Date.now();
    let insertedInstrument = await this.instrumentStore.insert(instrument);
    instrumentsLastUpdateMillis = instrument.updated;
    this.setInstrumentRes(res, CREATED, insertedInstrument); //201 Created
    this.io.emit('instrument-created', insertedInstrument);
  }

  setInstrumentRes(res, status, instrument) {
    res.body = instrument;
    res.set({
      [ETAG]: instrument.version,
      [LAST_MODIFIED]: new Date(instrument.updated)
    });
    res.status = status; //200 Ok or 201 Created
  }
}
