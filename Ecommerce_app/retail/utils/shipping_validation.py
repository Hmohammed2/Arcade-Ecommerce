# utils/shipping_validation.py
import re

UK_POSTCODE_REGEX = re.compile(
    r"^(GIR ?0AA|[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})$",
    re.IGNORECASE,
)

def validate_shipping_address(country: str, postcode: str):
    if not postcode:
        raise ValueError("Shipping postcode required")

    postcode = postcode.strip()

    if country == "GB":
        if not UK_POSTCODE_REGEX.match(postcode):
            raise ValueError("Invalid UK postcode")
    else:
        # Prevent users selecting GB for EU addresses and vice versa
        if UK_POSTCODE_REGEX.match(postcode):
            raise ValueError("Postcode does not match selected country")
