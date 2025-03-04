package enums;

public enum Role {
	    DoiTruong("DoiTruong"), GiamDoc("GiamDoc"), NhanVienVP("NhanVienVP"),
	    NhanVienXuong("NhanVienXuong"), KeToanTruong("KeToanTruong");
	    private final String value;

		private Role(String value) {
			this.value = value;
		}

		public String getValue() {
			return value;
		}
		public boolean compare(String value) {
			return this.value == value;
		}

		public static Role fromInt(String value) {
			for (Role type : values()) {
				if (type.compare(value)) {
					return type;
				}
			}
			return null;
		}
}
