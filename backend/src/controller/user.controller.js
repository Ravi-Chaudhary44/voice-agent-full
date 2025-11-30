import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    
    const { fullName, email, password } = req.body;
   
    if ([fullName, email, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

  
    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create({
        fullName,  // Fixed: schema uses fullName (capital N)
        email,
        password
    });

    if (!user) {
        throw new ApiError(500, "Failed to create user");
    }

const createdUser=await User.findById(user._id).select(
    "-password -refreshToken" 
)
 
    return res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                createdUser,
                "User registered successfully"
            )
        );
}
);

const loginUser=asyncHandler(async(req,res)=>{
    const{email,password}=req.body;
    if(!email || !password){
        throw new ApiError(400,"Please fill all the credentials");
    }
    const user=await User.findOne({email});
    if(!user){
        throw new ApiError(404,"User doesnot exist");
    }
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Password is incorrect");
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
    console.log(loggedInUser);
    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV="production"
    };
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {user:loggedInUser,accessToken,refreshToken},
            "User Loggedin successfully"
        )
    )
})


const getinfo=asyncHandler(async(req,res)=>{
    const user=req.user;
    if(!user){
        throw new ApiError("user is unauthorized");
    }
    console.log(user);
   res.status(200).json({
  statusCode: 200,
  data: user,
  message: "User details fetched successfully"
});

})
export  {
    registerUser,
    loginUser,
    getinfo
}
