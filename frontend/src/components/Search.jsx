import { MdSearch } from 'react-icons/md';

function Search({ value, onChange, placeholder }) {
    return (
        <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#003366] w-5 h-5" />
            <input
                type="text"
                className="pl-10 pr-4 py-2 border border-[#003366] rounded bg-white/87 text-black placeholder-black font-montserrat w-52 text-base"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    )
}

export default Search;