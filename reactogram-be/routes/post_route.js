const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const PostModel = mongoose.model("PostModel");
const protectedRoute = require("../middleware/protectedResource");

// all users posts
router.get("/allposts", (req, res) => {
    PostModel.find()
        .populate("author", "_id fullName profileImg")
        .populate("comments.commentedBy", "_id fullName")
        .then((dbPosts) => {
            res.status(200).json({ posts: dbPosts })
        })
        .catch((error) => {
            console.log(error);
        })
});

//all posts only from logged in user
router.get("/myallposts", protectedRoute, (req, res) => {
    PostModel.find({ author: req.user._id })
        .populate("author", "_id fullName profileImg")
        .then((dbPosts) => {
            res.status(200).json({ posts: dbPosts })
        })
        .catch((error) => {
            console.log(error);
        })
});

router.post("/createpost", protectedRoute, (req, res) => {
    const { description, location, image } = req.body;
    if (!description || !location || !image) {
        return res.status(400).json({ error: "One or more mandatory fields are empty" });
    }
    req.user.password = undefined;
    const postObj = new PostModel({ description: description, location: location, image: image, author: req.user });
    postObj.save()
        .then((newPost) => {
            res.status(201).json({ post: newPost });
        })
        .catch((error) => {
            console.log(error);
        })
});


// router.delete("/deletepost/:postId", protectedRoute, (req, res) => {
//     console.log(req.params.postId)
//     PostModel.findOne({ _id: req.params.postId })
//         .populate("author", "_id")
//         .then(( postFound) => {
//             if ( !postFound) {
//                 return res.status(400).json({ error: "Post does not exist" });
//             }
//             //check if the post author is same as loggedin user only then allow deletion
//             if (postFound.author._id.toString() === req.user._id.toString()) {
//                 postFound.remove()
//                     .then((data) => {
//                         res.status(200).json({ result: data });
//                     })
//                     .catch((error) => {
//                         console.log(error);
//                     })
//             }
//         }).catch((error)=>{
//             console.log(error)
//         })
// });


router.delete("/deletepost/:postId", protectedRoute, (req, res) => {
    const postId = req.params.postId;
  
    PostModel.findOneAndDelete({ _id: postId, author: req.user._id })
      .then((deletedPost) => {
        if (!deletedPost) {
          return res.status(400).json({ error: "Post does not exist or you are not authorized to delete it." });
        }
        res.status(200).json({ message: "Post deleted successfully." });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: "An error occurred while deleting the post." });
      });
  });
  


// router.put("/like", protectedRoute, (req, res) => {
//     PostModel.findByIdAndUpdate(req.body.postId, {
//         $push: { likes: req.user._id }
//     }, {
//         new: true //returns updated record
//     }).populate("author", "_id fullName")
//         .exec((error, result) => {
//             if (error) {
//                 return res.status(400).json({ error: error });
//             } else {
//                 res.json(result);
//             }
//         })
// });

router.put("/like", protectedRoute, async (req, res) => {
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.body.postId,
        { $push: { likes: req.user._id } },
        { new: true }
      )
        .populate("author", "_id fullName")
        .exec();
  
      if (!updatedPost) {
        return res.status(400).json({ error: "Post not found" });
      }
  
      res.json(updatedPost);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while updating the post" });
    }
  });
  


// router.put("/unlike", protectedRoute, (req, res) => {
//     PostModel.findByIdAndUpdate(req.body.postId, {
//         $pull: { likes: req.user._id }
//     }, {
//         new: true //returns updated record
//     }).populate("author", "_id fullName")
//         .exec((error, result) => {
//             if (error) {
//                 return res.status(400).json({ error: error });
//             } else {
//                 res.json(result);
//             }
//         })
// });

router.put("/unlike", protectedRoute, async (req, res) => {
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.body.postId,
        { $pull: { likes: req.user._id } },
        { new: true }
      )
        .populate("author", "_id fullName")
        .exec();
  
      if (!updatedPost) {
        return res.status(400).json({ error: "Post not found" });
      }
  
      res.json(updatedPost);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while updating the post" });
    }
  });


// router.put("/comment", protectedRoute, (req, res) => {

//     const comment = { commentText: req.body.commentText, commentedBy: req.user._id }

//     PostModel.findByIdAndUpdate(req.body.postId, {
//         $push: { comments: comment }
//     }, {
//         new: true //returns updated record
//     }).populate("comments.commentedBy", "_id fullName") //comment owner
//         .populate("author", "_id fullName")// post owner
//         .exec((error, result) => {
//             if (error) {
//                 return res.status(400).json({ error: error });
//             } else {
//                 res.json(result);
//             }
//         })
// });

router.put("/comment", protectedRoute, async (req, res) => {
    try {
      const comment = { commentText: req.body.commentText, commentedBy: req.user._id };
  
      const updatedPost = await PostModel.findByIdAndUpdate(
        req.body.postId,
        { $push: { comments: comment } },
        { new: true }
      )
        .populate("comments.commentedBy", "_id fullName")
        .populate("author", "_id fullName")
        .exec();
  
      if (!updatedPost) {
        return res.status(400).json({ error: "Post not found" });
      }
  
      res.json(updatedPost);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while updating the post" });
    }
  });
  
module.exports = router;
