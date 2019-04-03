+++
date = "2019-04-03T14:29:23+00:00"
draft = true
title = "Colorado Test"
[payment_schedule]
date = "2019-04-11T04:00:00+00:00"
[[payment_schedule.blocks]]
copy = "Benefits are made available from the 1st to the 10th of every month, based on the last digit of the recipient’s SSN. If the:"
template = "bock-text"
[[payment_schedule.blocks]]
template = "bock-table"
[payment_schedule.blocks.headers]
column_1 = " SSN ends in"
column_2 = "Benefits available"
[[payment_schedule.blocks.rows]]
column_1 = "1"
column_2 = "1st of the month"
[[payment_schedule.blocks.rows]]
column_1 = "2"
column_2 = "2nd of the month"
[[payment_schedule.blocks]]
copy = "\\*Cash benefits are made available from the 1st to the 3rd of every month, based on the last digit of the recipient’s SSN:"
template = "bock-text"
[[payment_schedule.blocks]]
template = "bock-table"
[payment_schedule.blocks.headers]
column_1 = " SSN ends in"
column_2 = "Benefits available"
[[payment_schedule.blocks.rows]]
column_1 = "7, 8, 9, or 0"
column_2 = "1st of the month"

+++
