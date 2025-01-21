import dbConnect from '@/lib/dbConnect'
import UserModel from '@/model/User.model';
import { useSession } from 'next-auth/react';
import React from 'react'

const page = async (request: Request, {params}: {params: {username:  string}} ) => {
  await dbConnect();

  const username = params.username

  try {
    const user = UserModel.findOne({username})
    const currentUser = useSession();
  } catch (error) {
    
  }

  const onSubmit = () => {

  }

  return (
    <div>
      
    </div>
  )
}

export default page
