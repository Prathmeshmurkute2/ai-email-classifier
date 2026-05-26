import Category from "../models/category.model.js"
import Email from "../models/email.model.js"

export const createCategory = async (req,res)=>{
    try{
        const { name, color } = req.body;
        const userId = req.user?.id || null;

        const existingCategory = await Category.findOne({
            name: name.toLowerCase(),
            userId,
        });

        if(existingCategory){
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await Category.create({
            name,
            color,
            userId,
            isSystem: false,
        });

        res.status(201).json({
            success: true,
            data: category,
        });
    }
    catch(error){
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export const getCategories = async (req, res) => {
  try {
    const userId = req.user?.id || null;

    const categories = await Category.find({
      $or: [
        { userId },        // user categories
        { isSystem: true } // default categories
      ]
    });

    res.status(200).json({
      success: true,
      data: categories,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    // 1. Ensure the category belongs to the user and is not a system category
    const category = await Category.findOne({ _id: categoryId, userId, isSystem: false });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found or you do not have permission to delete it.",
      });
    }

    // 2. Clear out any references in user's emails to prevent orphans
    await Email.updateMany(
      { userId, predictedLabel: categoryId },
      { $set: { predictedLabel: null } }
    );
    await Email.updateMany(
      { userId, userAssignedLabel: categoryId },
      { $set: { userAssignedLabel: null } }
    );

    // 3. Delete the category
    await Category.deleteOne({ _id: categoryId });

    res.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};