import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission {
    create: boolean;
    view: boolean;
    edit: boolean;
}

export interface IProfile extends Document {
    profileName: string;
    status: boolean;
    permission: {
        leads: IPermission;
        career: IPermission;
        users: IPermission;
        support: IPermission;
        blog: IPermission;
        meeting: IPermission;
        pricing: IPermission;
        rolesAndPermission: IPermission;
    };
    createdBy?: Schema.Types.ObjectId;
    updatedBy?: Schema.Types.ObjectId;
}

const PermissionSchema= new Schema<IPermission>({
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },

},{
    _id:false
});


const ProfileSchema =  new Schema<IProfile>({
    profileName: { type: String, required: true },
    status: { type: Boolean, default: true, required: true },
    permission: {
        leads: { type: PermissionSchema, required: true },
        career: { type: PermissionSchema, required: true },
        users: { type: PermissionSchema, required: true },
        support: { type: PermissionSchema, required: true },
        blog: { type: PermissionSchema, required: true },
        meeting: { type: PermissionSchema, required: true },
        pricing: { type: PermissionSchema, required: true },
        rolesAndPermission: { type: PermissionSchema, required: true },
    
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
});


const ProfileModel = mongoose.model<IProfile>('Profile', ProfileSchema);

export default ProfileModel;
