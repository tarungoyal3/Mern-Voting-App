const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT;


app.use(cors()); 
app.use(express.json()); 

const MONGO_URI = process.env.MONGO_URI ;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected with MongoDb successfully!");
        initializeDatabase(); 
    })
    .catch(err => console.error("Cannot connect with MongoDB:", err));


const voteSchema = new mongoose.Schema({
    option: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 }
});

const Vote = mongoose.model('Vote', voteSchema);


const VOTING_OPTIONS = ['Option A', 'Option B', 'Option C'];

const initializeDatabase = async () => {
    try {
        const count = await Vote.countDocuments();
        
        if (count === 0) {
            const optionsToSave = VOTING_OPTIONS.map(option => ({ option: option, count: 0 }));
            await Vote.insertMany(optionsToSave);
            console.log("Database is ready with voting options.");
        }
    } catch (error)
    {
        console.error("Error in database initialisation", error);
    }
};


app.get('/api/votes', async (req, res) => {
    try {
        const votes = await Vote.find({});

        const formattedVotes = votes.reduce((acc, vote) => {
            acc[vote.option] = vote.count;
            return acc;
        }, {});
        res.status(200).json(formattedVotes);
    } catch (error) {
        res.status(500).json({ message: "Cannot fetch votes" });
    }
});

app.post('/api/vote', async (req, res) => {
    const { option } = req.body; 
    if (!VOTING_OPTIONS.includes(option)) {
        return res.status(400).json({ message: "You chose the wrong option" });
    }
    try {
        
        await Vote.findOneAndUpdate({ option }, { $inc: { count: 1 } });
        res.status(200).json({ message: "Your vote is successfully submitted" });
    } catch (error) {
        res.status(500).json({ message: "There is error in submitting vote." });
    }
});


app.listen(PORT, () => {
    console.log(`Backend is running on server port ${PORT}`);
});

