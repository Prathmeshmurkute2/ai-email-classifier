import Category from "../models/category.model.js"

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