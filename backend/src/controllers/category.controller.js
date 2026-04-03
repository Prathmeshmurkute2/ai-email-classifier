import Category from "../models/category.model.js"

export const createCategory = async (req,res)=>{
    try{
        const { name } = res.body;
        const userId = req.user?.id||null;

        const category = await Category.create({
            name,
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