/**
 * Created by hilkeheremans on 17/12/15.
 */

import _ from 'lodash'
import {Readable} from 'stream'

export default class StreamCombine extends Readable {

    constructor(streams, key, transform = (key) => key) {
        super({objectMode: true})
        if (!streams) throw new Error('Streams argument is required')
        if (!_.isArray(streams)) throw new Error('Streams should be an Array')
        if (_.isEmpty(streams)) throw new Error('Streams array should not be empty')
        if (!key) throw new Error('Key argument is required')
        this.key = key
        this.transform = transform
        this.streams = streams

        this.ended = _.map(streams, () => false)
        this.current = _.map(streams, () => null)
        this.indexes = _.map(streams, () => 0)
        this.busy = false

        _.each(streams, (stream, index) => {
            stream.on('error', (error) => this.emit('error', error))
            stream.on('end', this.handleEnd.bind(this, index))
            stream.on('data', this.handleData.bind(this, index))
        })

    }

    _read() {
        if (this.busy) return
        this.busy = true
        return this.resumeStreams()
    }

    getLowestKeyIndexes() {
        let keys = []
        let skip = false

        _.each(this.current, (obj, index) => {
            if (obj) {
                keys[index] = this.transform(obj[this.key])
                //keys[index] = obj[this.key]
            } else {
                if (this.ended[index]) {
                    keys[index] = Infinity
                } else {
                    skip = true
                    return false
                }
            }
        })
        if (skip) return []
        this.lowest = _.min(keys)

        return _.chain(this.current).map((obj, index) => {
            if (obj && this.transform(obj[this.key]) === this.lowest) return index
            //if (obj && obj[this.key] === this.lowest) return index
        }).filter((i) => i !== undefined).value()
    }

    resumeStreams() {
        let reEvaluatePush = false

        _.each(this.indexes, (index) => {
            this.current[index] = null
            if (this.ended[index]) {
                if (!reEvaluatePush) reEvaluatePush = true
            } else {
                this.streams[index].resume()
            }
        })
        if (reEvaluatePush) return this.evaluatePush()
    }

    evaluatePush() {
        this.indexes = this.getLowestKeyIndexes()

        if (_.size(this.indexes) === 0) return

        let send = {
            data: _.map(this.indexes, (index => this.current[index])),
            indexes: this.indexes
        }
        send[this.key] = this.lowest

        let pushMore = this.push(send)

        if (!pushMore) {
            this.busy = false
            return
        }

        return this.resumeStreams()
    }

    handleData(index, obj) {
        this.streams[index].pause()
        this.current[index] = obj
        this.evaluatePush()
    }

    handleEnd(index) {
        this.ended[index] = true
        this.evaluatePush()
        if (_.every(this.ended)) this.push(null)
    }
}
