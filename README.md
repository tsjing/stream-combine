stream-combine
==============

Merges chronological time-based streams. The streams are compared using a property and/or a custom transform function you can provide.

This package is nearly completely based on @viriciti's great work over at https://github.com/viriciti/stream-combine.

The library has been converted to ES6 and a new feature `transform ` was added. For our use case, the streams we received were not always in the same or the proper format and required some conversion before they were added, but the original stream data must not be mutated.

> Tests were automagically converted to JS from the original author's CoffeeScript files, so they are messy. We will update these later.

It is perfect for combining **time series** or **event streams** (eg combining streams in an event-sourcing system using multiple sources)

> Currently this library is only intended for use on nodejs v4 and above, since that is the minimum version we use in our systems. It would be trivially easy to break out this library to other platforms, so feel free to submit a PR!

Usage
-----
We assume the stream is properly sorted (for perf reasons, this is important). Leave the sorting logic to whatever is providing you with the stream (usually a database like Mongo).

```coffee-script
// create some streams
let streams = [...array_of_streams] // this is an array of streams

// the library assumes your stream is sorted by the time variable.
// you can for example grab some MongoDB streams like so:
streams = [
  collection.find({...params}).sort('timestamp').stream(),
  collection.find({...otherParams}).sort('timestamp').stream(),
  collection.find({...otherParams}).sort('timestamp').stream(),
]

// now combine the streams:
let combinedStream = new StreamCombine(streams, "id")

// CASE 1: pipe through
combinedStream.pipe(someOtherStream)

// CASE 2: use flowing mode
combinedStream.on('data', (data) => {
  // do something with the data
  // the data object has the following shape:
  // emits objects like
  // {
  //  indexes: [0, 2] 
  //  data:    [ { timestamp: 6, some-data-from-time-series-1 }, { timestamp: 6, some-data-from-time-series-3 } ]
  // }
  
})

combinedStream.on('end', () => {
  console.log('all done')
})

```

Or where:

`_id` is the common time stamp of the next object in chronological order

`indexes` is the indexes of the streams that have the current time in common

`data` is the actual data of the common time step