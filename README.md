# README #

# Elevator Hackathon Site #

Site is built on the MEAN stack.  All client code is in client folder, all server code is in server folder.  To dev:

1. get code
2. "npm update"
3. start app.js in the server folder 

## Database ##

The database access is through Mongoose.  Models are at server/model.  The data model is very simple:

* Teams (team name & password)
* Challenge (stores the challenge JSON to score against) ** this is the only thing that needs to be created and seeded with the challenges
* TeamScore (stores the results of a teams submittal.  Details are not scored, just the number of stops and average wait time

The actual connection handling is at server/repository/database.js.  This is required at startup and handles subsequent Mongoose data access.  The models are registered as well.
