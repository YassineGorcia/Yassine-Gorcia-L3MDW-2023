const Board = require('../models/board')
const Section = require('../models/section')
const Task = require('../models/task')


async function createInitialSections(boardId) {
  const initialSections = [
    { board: boardId, title: 'To Do' },
    { board: boardId, title: 'Doing' },
    { board: boardId, title: 'Done' },
  ];

  const sections = await Section.create(initialSections);
  return sections;
}

exports.create = async (req, res) => {
  try {
    const boardsCount = await Board.find().count();
    const board = await Board.create({
      users: [req.user._id], // Add the user to the users array
      boardAdmin: req.user._id, // Set the user as the board admin
      position: boardsCount > 0 ? boardsCount : 0
    });

    // Call createInitialSections to create initial sections
    await createInitialSections(board._id);

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.getAll = async (req, res) => {
  const userId = req.user._id;

  try {
    const boards = await Board.find({ users: userId }).sort('-position');
    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updatePosition = async (req, res) => {
  const { boards } = req.body
  try {
    for (const key in boards.reverse()) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { position: key } }
      )
    }
    res.status(200).json('updated')
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getOne = async (req, res) => {
  const { boardId } = req.params;
  const userId = req.user._id;

  try {
    const board = await Board.findOne({ _id: boardId, users: userId });
    if (!board) return res.status(404).json('Board not found');

    const sections = await Section.find({ board: boardId });
    for (const section of sections) {
      const tasks = await Task.find({ section: section.id })
        .populate('section')
        .sort('-position');
      section._doc.tasks = tasks;
    }

    board._doc.sections = sections;
    res.status(200).json(board);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.update = async (req, res) => {
  const { boardId } = req.params
  const { title, description, favourite } = req.body

  try {
    if (title === '') req.body.title = 'Untitled'
    if (description === '') req.body.description = 'Add description here'
    const currentBoard = await Board.findById(boardId)
    if (!currentBoard) return res.status(404).json('Board not found')

    if (favourite !== undefined && currentBoard.favourite !== favourite) {
      const favourites = await Board.find({
        user: currentBoard.user,
        favourite: true,
        _id: { $ne: boardId }
      }).sort('favouritePosition')
      if (favourite) {
        req.body.favouritePosition = favourites.length > 0 ? favourites.length : 0
      } else {
        for (const key in favourites) {
          const element = favourites[key]
          await Board.findByIdAndUpdate(
            element.id,
            { $set: { favouritePosition: key } }
          )
        }
      }
    }

    const board = await Board.findByIdAndUpdate(
      boardId,
      { $set: req.body }
    )
    res.status(200).json(board)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getFavourites = async (req, res) => {
  try {
    const favourites = await Board.find({
      user: req.user._id,
      favourite: true
    }).sort('-favouritePosition')
    res.status(200).json(favourites)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.updateFavouritePosition = async (req, res) => {
  const { boards } = req.body
  try {
    for (const key in boards.reverse()) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { favouritePosition: key } }
      )
    }
    res.status(200).json('updated')
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.delete = async (req, res) => {
  const { boardId } = req.params
  try {
    const sections = await Section.find({ board: boardId })
    for (const section of sections) {
      await Task.deleteMany({ section: section.id })
    }
    await Section.deleteMany({ board: boardId })

    const currentBoard = await Board.findById(boardId)

    if (currentBoard.favourite) {
      const favourites = await Board.find({
        user: currentBoard.user,
        favourite: true,
        _id: { $ne: boardId }
      }).sort('favouritePosition')

      for (const key in favourites) {
        const element = favourites[key]
        await Board.findByIdAndUpdate(
          element.id,
          { $set: { favouritePosition: key } }
        )
      }
    }

    await Board.deleteOne({ _id: boardId })

    const boards = await Board.find().sort('position')
    for (const key in boards) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { position: key } }
      )
    }

    res.status(200).json('deleted')
  } catch (err) {
    res.status(500).json(err)
  }
}



exports.addUserToBoard = async (req, res) => {
 

  const { boardId } = req.params;
  const { userId } = req.body.username; // Extract the userId from req.body.username
  console.log('userId:', userId);

  try {
    // Find the board by ID
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if the user is already added to the board
    const isUserAdded = board.users.some((user) => user.toString() === userId);
    if (isUserAdded) {
      return res.status(400).json({ message: 'User already added to the board' });
    }

    // Add the user's ID to the board's users array
    board.users.push(userId);

    // Save the updated board
    const updatedBoard = await board.save();

    // Log the message in the console
    console.log(`User with ID ${userId} added to the board`);

    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add user to board', error });
  }
};

exports.removeUserFromBoard = async (req, res) => {
  const { boardId, userId } = req.params;

  try {
    // Find the board by ID
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if the user is already added to the board
    const userIndex = board.users.findIndex((user) => user.toString() === userId);
    if (userIndex === -1) {
      return res.status(400).json({ message: 'User not found in the board' });
    }

    // Remove the user's ID from the board's users array
    board.users.splice(userIndex, 1);

    // Save the updated board
    const updatedBoard = await board.save();

    console.log(`User with ID ${userId} removed from the board with ID ${boardId}`);

    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove user from board', error });
  }
};