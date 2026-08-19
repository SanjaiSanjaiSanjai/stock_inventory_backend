const Button = ({btnName,classname,onclick}) => {
  return (
    <div>
        <div>
            <button className={classname} onClick={onclick}>
                {btnName}
            </button>
        </div>
    </div>
  )
}

export default Button
