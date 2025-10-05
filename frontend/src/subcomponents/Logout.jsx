import profile from "../imagez/256-2560255_user-icon-user-white-icon-transparent-hd-png-removebg-preview.png"

export default function Logout ({styl}) {

    return (
        <div className={styl.header}>

            <button className={styl.prof_button}>
                <img src={profile} alt="profile" className={styl.img}/>
                <h3 className={styl.name}>Dawn MacIsaac</h3>
            </button>

            <button className={styl.log}>
                <h3>Log Out</h3>
            </button>
        </div>
    );
}