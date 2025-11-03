export default function Header ({styl, code, title}) {

    return (
        <h3 className={styl.ti}>{code} : {title}</h3>
    );
}